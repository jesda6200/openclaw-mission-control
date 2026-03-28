class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res) => {
    const result = await this.authService.register(req.validatedBody);
    res.status(201).json({ success: true, data: result });
  };

  login = async (req, res) => {
    const result = await this.authService.login(req.validatedBody);
    res.json({ success: true, data: result });
  };

  refresh = async (req, res) => {
    const result = await this.authService.refresh(req.validatedBody.refreshToken);
    res.json({ success: true, data: result });
  };

  logout = async (req, res) => {
    await this.authService.logout(req.validatedBody.refreshToken);
    res.json({ success: true, data: { loggedOut: true } });
  };

  me = async (req, res) => {
    const user = await this.authService.me(req.auth.sub);
    res.json({ success: true, data: { user } });
  };

  listUsers = async (_req, res) => {
    const users = await this.authService.listUsers();
    res.json({ success: true, data: { users } });
  };
}

module.exports = { AuthController };
