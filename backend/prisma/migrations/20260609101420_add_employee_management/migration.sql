-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "department_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeProfile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "department_id" INTEGER,
    "phone" VARCHAR(20),
    "address" TEXT,
    "designation" VARCHAR(100),
    "salary" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeImage" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,

    CONSTRAINT "EmployeeImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "skill_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" SERIAL NOT NULL,
    "employee_id" INTEGER NOT NULL,
    "skill_id" INTEGER NOT NULL,

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeProfile" ADD CONSTRAINT "EmployeeProfile_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeImage" ADD CONSTRAINT "EmployeeImage_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "EmployeeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
