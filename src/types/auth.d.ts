declare namespace Auth {
  type Token = {
    accessToken: string; // 访问令牌
    accessExpiresIn: number;
    refreshExpiresIn: number;
  };
}
