const prisma = require("../config/db");

class EmployeeRepository {
  async findById(id) {
    return prisma.employeeProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
        images: true,
        employeeSkills: {
          include: {
            skill: true
          }
        }
      }
    });
  }

  async findByUserId(userId) {
    return prisma.employeeProfile.findFirst({
      where: { userId: parseInt(userId) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true
      }
    });
  }

  async createProfile(data, skills, imageUrls) {
    const profile = await prisma.employeeProfile.create({
      data: {
        userId: data.userId ? parseInt(data.userId) : null,
        departmentId: data.departmentId ? parseInt(data.departmentId) : null,
        phone: data.phone,
        address: data.address,
        designation: data.designation,
        salary: data.salary ? parseFloat(data.salary) : null
      }
    });

    if (skills && Array.isArray(skills)) {
      await prisma.employeeSkill.createMany({
        data: skills.map(skillId => ({
          employeeId: profile.id,
          skillId: parseInt(skillId)
        }))
      });
    }

    if (imageUrls && Array.isArray(imageUrls)) {
      await prisma.employeeImage.createMany({
        data: imageUrls.map(url => ({
          employeeId: profile.id,
          imageUrl: url
        }))
      });
    }

    return this.findById(profile.id);
  }

  async updateProfile(id, data, skills, imageUrls) {
    await prisma.employeeProfile.update({
      where: { id: parseInt(id) },
      data: {
        userId: data.userId ? parseInt(data.userId) : null,
        departmentId: data.departmentId ? parseInt(data.departmentId) : null,
        phone: data.phone,
        address: data.address,
        designation: data.designation,
        salary: data.salary ? parseFloat(data.salary) : null
      }
    });

    // Reset and insert skills
    await prisma.employeeSkill.deleteMany({
      where: { employeeId: parseInt(id) }
    });

    if (skills && Array.isArray(skills)) {
      await prisma.employeeSkill.createMany({
        data: skills.map(skillId => ({
          employeeId: parseInt(id),
          skillId: parseInt(skillId)
        }))
      });
    }

    // Reset and insert images
    await prisma.employeeImage.deleteMany({
      where: { employeeId: parseInt(id) }
    });

    if (imageUrls && Array.isArray(imageUrls)) {
      await prisma.employeeImage.createMany({
        data: imageUrls.map(url => ({
          employeeId: parseInt(id),
          imageUrl: url
        }))
      });
    }

    return this.findById(id);
  }

  async deleteProfile(id) {
    return prisma.employeeProfile.delete({
      where: { id: parseInt(id) }
    });
  }

  async findAll({ search, limit, offset, sortBy, sortOrder, departmentId }) {
    const where = {};

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    if (search) {
      where.OR = [
        { designation: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
        {
          user: {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } }
            ]
          }
        },
        {
          department: {
            department_name: { contains: search, mode: "insensitive" }
          }
        },
        {
          employeeSkills: {
            some: {
              skill: {
                skill_name: { contains: search, mode: "insensitive" }
              }
            }
          }
        }
      ];
    }

    const order = {};
    if (sortBy) {
      if (sortBy === "name" || sortBy === "email") {
        order.user = { [sortBy]: sortOrder || "asc" };
      } else if (sortBy === "department_name") {
        order.department = { department_name: sortOrder || "asc" };
      } else {
        order[sortBy] = sortOrder || "asc";
      }
    } else {
      order.createdAt = "desc";
    }

    const employees = await prisma.employeeProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
        images: true,
        employeeSkills: {
          include: {
            skill: true
          }
        }
      },
      orderBy: order,
      take: limit ? parseInt(limit) : undefined,
      skip: offset ? parseInt(offset) : undefined
    });

    const total = await prisma.employeeProfile.count({ where });

    return { employees, total };
  }

  async getDashboardStats() {
    const [
      employees,
      departments,
      skills,
      images,
      assets,
      allocatedAssets,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves
    ] = await Promise.all([
      prisma.employeeProfile.count(),
      prisma.department.count(),
      prisma.skill.count(),
      prisma.employeeImage.count(),
      prisma.asset.count(),
      prisma.asset.count({ where: { status: "Allocated" } }),
      // Use new normalized leave_applications table
      prisma.leaveApplication.count({ where: { status: "Pending" } }),
      prisma.leaveApplication.count({ where: { status: "Approved" } }),
      prisma.leaveApplication.count({ where: { status: "Rejected" } })
    ]);

    // Total salary expense
    const salaryAgg = await prisma.employeeProfile.aggregate({ _sum: { salary: true } });
    const totalSalary = Number(salaryAgg._sum.salary || 0);

    // Department wise employee count
    const deptWise = await prisma.employeeProfile.groupBy({
      by: ["departmentId"],
      _count: { id: true }
    });
    const deptList = await prisma.department.findMany();
    const departmentStats = deptList.map(d => {
      const match = deptWise.find(item => item.departmentId === d.id);
      return { name: d.department_name, value: match ? match._count.id : 0 };
    });

    return {
      employees,
      departments,
      skills,
      images,
      assets,
      allocatedAssets,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalSalary,
      departmentStats
    };
  }

  async getJoinsRaw() {
    // Query 1: Employee + Department
    const join1 = await prisma.$queryRawUnsafe(`
      SELECT u.name, ep.designation, d.department_name
      FROM employee_profiles ep
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN departments d ON ep.department_id = d.id
      ORDER BY u.name;
    `);

    // Query 2: Employee + Skills
    const join2 = await prisma.$queryRawUnsafe(`
      SELECT u.name, s.skill_name
      FROM employee_skills es
      INNER JOIN employee_profiles ep ON es.employee_id = ep.id
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN skills s ON es.skill_id = s.id
      ORDER BY u.name;
    `);

    // Query 3: Pending Leaves with user and leave type
    const join3 = await prisma.$queryRawUnsafe(`
      SELECT u.name, lt.leave_name, la.status, la.reason, la.from_date, la.to_date, la.total_days
      FROM leave_applications la
      INNER JOIN employee_profiles ep ON la.employee_id = ep.id
      INNER JOIN users u ON ep.user_id = u.id
      INNER JOIN leave_types lt ON la.leave_type_id = lt.id
      WHERE la.status = 'Pending'
      ORDER BY la.from_date;
    `);

    // Query 4: Department Wise Employee Count (GROUP BY) - CAST to avoid BigInt JSON issue
    const join4Raw = await prisma.$queryRawUnsafe(`
      SELECT d.department_name, CAST(COUNT(*) AS INTEGER) AS total_employees
      FROM employee_profiles ep
      INNER JOIN departments d ON ep.department_id = d.id
      GROUP BY d.department_name
      ORDER BY total_employees DESC;
    `);

    const join4 = join4Raw.map(r => ({ ...r, total_employees: Number(r.total_employees) }));

    return { join1, join2, join3, join4 };
  }

  async getEmployeeSummaryView() {
    return prisma.$queryRawUnsafe(`
      SELECT * FROM employee_summary;
    `);
  }
}

module.exports = new EmployeeRepository();
