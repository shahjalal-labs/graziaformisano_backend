import express from "express";
import { professionController } from "./profession.controller";

const router = express.Router();

router.post("/city-create", professionController.createCity);
router.get("/cities", professionController.cities);
router.post("/profession-create", professionController.createProfession);
router.get("/professions", professionController.professions);
router.post("/sub-profession-create", professionController.createSubProfession);
router.delete("/city/:id", professionController.deleteCity);
router.delete("/profession/:id", professionController.deleteProfession);
router.delete("/sub-profession/:id", professionController.deleteSubProfession);

export const professionRoutes = router;
