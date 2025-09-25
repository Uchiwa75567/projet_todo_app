import { UserService } from "../services/UserService.js";
class AuthController {
    constructor() {
        this.register = async (req, res) => {
            try {
                const { name, email, password } = req.body;
                const out = await this.service.register(name, email, password);
                res.status(201).json(out);
            }
            catch (e) {
                res.status(400).json({ error: e.message || "Bad request" });
            }
        };
        this.login = async (req, res) => {
            try {
                const { email, password } = req.body;
                const out = await this.service.login(email, password);
                res.json(out);
            }
            catch (e) {
                res.status(400).json({ error: e.message || "Bad request" });
            }
        };
        this.service = new UserService();
    }
}
export default new AuthController();
