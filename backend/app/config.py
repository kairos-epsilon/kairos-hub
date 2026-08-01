from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str = "postgresql://kairos:kairos@localhost:5432/kairos_hub"
    jwt_secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7日間
    upload_dir: str = "/app/uploads"
    cors_origins: list[str] = ["http://localhost:3000"]
    github_api_token: str = ""  # 任意。未設定でもREADME取得は動作するがレート制限が厳しくなる


settings = Settings()
