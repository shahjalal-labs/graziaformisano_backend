import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { professionService } from "./profession.service";

const createCity = catchAsync(async (req, res) => {
  await professionService.createCityIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "City created successfully",
  });
});
const cities = catchAsync(async (req, res) => {
  const cities = await professionService.getAllCitiesFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Cities retrieved successfully",
    data: cities,
  });
});

const createProfession = catchAsync(async (req, res) => {
  await professionService.createProfessionIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profession created successfully",
  });
});

const professions = catchAsync(async (req, res) => {
  const professions = await professionService.getAllProfessionsFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Professions retrieved successfully",
    data: professions,
  });
});
const professionsForAdmin = catchAsync(async (req, res) => {
  const professions = await professionService.getAllProfessionsForAdminFromDB();
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Professions retrieved successfully",
    data: professions,
  });
});

const createSubProfession = catchAsync(async (req, res) => {
  await professionService.createSubProfessionIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Sub-Profession created successfully",
  });
});

const toggleProfessionStatus = catchAsync(async (req, res) => {
  const result = await professionService.toggleProfessionStatusInDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: result.message,
  });
});
const deleteCity = catchAsync(async (req, res) => {
  await professionService.deleteCityFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "City deleted successfully",
  });
});

const deleteProfession = catchAsync(async (req, res) => {
  await professionService.deleteProfessionFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profession deleted successfully",
  });
});

const deleteSubProfession = catchAsync(async (req, res) => {
  await professionService.deleteSubProfessionFromDB(req.params.id);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Sub-Profession deleted successfully",
  });
});

export const professionController = {
  createCity,
  cities,
  createProfession,
  professions,
  createSubProfession,
  deleteCity,
  deleteProfession,
  deleteSubProfession,
  toggleProfessionStatus,
  professionsForAdmin,
};
