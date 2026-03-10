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

const createSubProfession = catchAsync(async (req, res) => {
  await professionService.createSubProfessionIntoDB(req.body);
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Sub-Profession created successfully",
  });
});


export const professionController = {
  createCity,
  cities,
  createProfession,
  professions,
  createSubProfession,
};
