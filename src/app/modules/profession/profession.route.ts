import express from "express";
import { professionController } from "./profession.controller";

const router = express.Router();

router.post("/city-create", professionController.createCity);
router.get("/cities", professionController.cities);
router.post("/profession-create", professionController.createProfession);
router.get("/professions", professionController.professions);
router.get("/professions/admin", professionController.professionsForAdmin);
router.post("/sub-profession-create", professionController.createSubProfession);
router.delete("/city/:id", professionController.deleteCity);
router.delete("/profession/:id", professionController.deleteProfession);
router.delete("/sub-profession/:id", professionController.deleteSubProfession);
router.patch("/toggle-profession-status/:id", professionController.toggleProfessionStatus);

export const professionRoutes = router;
