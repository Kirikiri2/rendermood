-- AlterTable
ALTER TABLE "Option" ADD COLUMN     "parentId" INTEGER;

-- CreateTable
CREATE TABLE "OptionDependency" (
    "id" SERIAL NOT NULL,
    "parentOptionId" INTEGER NOT NULL,
    "childOptionId" INTEGER NOT NULL,

    CONSTRAINT "OptionDependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SliderConfig" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "optionId" INTEGER NOT NULL,
    "min" INTEGER NOT NULL,
    "max" INTEGER NOT NULL,
    "step" INTEGER NOT NULL,
    "defaultValue" INTEGER,

    CONSTRAINT "SliderConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OptionDependency_parentOptionId_childOptionId_key" ON "OptionDependency"("parentOptionId", "childOptionId");

-- CreateIndex
CREATE UNIQUE INDEX "SliderConfig_questionId_optionId_key" ON "SliderConfig"("questionId", "optionId");

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Option"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionDependency" ADD CONSTRAINT "OptionDependency_parentOptionId_fkey" FOREIGN KEY ("parentOptionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OptionDependency" ADD CONSTRAINT "OptionDependency_childOptionId_fkey" FOREIGN KEY ("childOptionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SliderConfig" ADD CONSTRAINT "SliderConfig_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SliderConfig" ADD CONSTRAINT "SliderConfig_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "Option"("id") ON DELETE CASCADE ON UPDATE CASCADE;
