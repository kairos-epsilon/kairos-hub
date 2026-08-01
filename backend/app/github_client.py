import base64
import re

import httpx

from app.config import settings

GITHUB_URL_PATTERN = re.compile(
    r"github\.com/(?P<owner>[^/]+)/(?P<repo>[^/#?]+)"
)


def parse_owner_repo(github_url: str) -> tuple[str, str] | None:
    match = GITHUB_URL_PATTERN.search(github_url)
    if not match:
        return None
    owner = match.group("owner")
    repo = match.group("repo").removesuffix(".git")
    return owner, repo


async def fetch_readme(github_url: str) -> str | None:
    """GitHub APIからREADMEを取得しMarkdown文字列を返す。取得失敗時はNone。"""
    parsed = parse_owner_repo(github_url)
    if parsed is None:
        return None
    owner, repo = parsed

    headers = {"Accept": "application/vnd.github.v3+json"}
    if settings.github_api_token:
        headers["Authorization"] = f"Bearer {settings.github_api_token}"

    url = f"https://api.github.com/repos/{owner}/{repo}/readme"

    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(url, headers=headers)
        if response.status_code != 200:
            return None
        data = response.json()
        content_b64 = data.get("content", "")
        try:
            return base64.b64decode(content_b64).decode("utf-8")
        except (ValueError, UnicodeDecodeError):
            return None
