import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";

const createCityIntoDB = async (payload: any) => {
  const existingCity = await prisma.city.findUnique({
    where: {
      cityName: payload.cityName,
    },
  });

  if (existingCity) {
    throw new ApiError(
      400,
      `City with name ${payload.cityName} already exists`,
    );
  }

  await prisma.city.create({
    data: {
      cityName: payload.cityName,
    },
  });
  return;
};

const getAllCitiesFromDB = async () => {
  const cities = await prisma.city.findMany({
    select: {
      id: true,
      cityName: true,
    },
  });
  return cities;
};

const createProfessionIntoDB = async (payload: any) => {
  const existingProfession = await prisma.profession.findUnique({
    where: {
      professionName: payload.professionName,
    },
  });

  if (existingProfession) {
    throw new ApiError(
      400,
      `Profession with name ${payload.professionName} already exists`,
    );
  }

  await prisma.profession.create({
    data: {
      professionName: payload.professionName,
    },
  });

  return;
};

const getAllProfessionsFromDB = async () => {
  const professions = await prisma.profession.findMany({
    select: {
      id: true,
      professionName: true,
      subProfessions: {
        select: {
          id:true,
          subProfessionName: true,
        },
      },
    },
  });
  return professions;
};

const createSubProfessionIntoDB = async (payload: any) => {
  await prisma.profession.findUniqueOrThrow({
    where: {
      id: payload.professionId,
    },
  });

  const existingSubProfession = await prisma.subProfession.findUnique({
    where: { subProfessionName: payload.subProfessionName },
  });

  if (existingSubProfession) {
    throw new ApiError(
      400,
      `Sub profession with name ${payload.subProfessionName} already exists`,
    );
  }

  await prisma.subProfession.create({
    data: {
      subProfessionName: payload.subProfessionName,
      professionId: payload.professionId,
    },
  });

  return;
};

const deleteCityFromDB = async (cityId: string) => {
  await prisma.city.delete({
    where: {
      id: cityId,
    },
  });

  return;
};

const deleteProfessionFromDB = async (professionId: string) => {
  await prisma.profession.delete({
    where: {
      id: professionId,
    },
  });
};

const deleteSubProfessionFromDB = async (subProfessionId: string) => {
  await prisma.subProfession.delete({
    where: {
      id: subProfessionId,
    },
  });
};

export const professionService = {
  createCityIntoDB,
  getAllCitiesFromDB,
  createProfessionIntoDB,
  getAllProfessionsFromDB,
  createSubProfessionIntoDB,
  deleteCityFromDB,
  deleteProfessionFromDB,
  deleteSubProfessionFromDB,
};
