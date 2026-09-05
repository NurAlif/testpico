from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, SecretStr


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=8_000)
    places: list[dict] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)


class AISelection(BaseModel):
    provider: Literal["gemini", "deepseek", "openrouter", "freerouter", "groq", "ollama"]
    model: str = Field(default="", max_length=200, pattern=r"^[^\r\n]*$")
    api_key: SecretStr | None = Field(default=None, max_length=4096)
    fallback: bool = False
    fallback_model: str = Field(default="", max_length=200)


class LocalSetupInput(BaseModel):
    google_places_api_key: SecretStr | None = Field(default=None, max_length=4096)
    google_maps_embed_api_key: SecretStr | None = Field(default=None, max_length=4096)
    complete: bool = False


class ChatRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    message: str = Field(min_length=1, max_length=4_000)
    history: list[Message] = Field(default_factory=list, max_length=20)
    conversation_id: UUID | None = None
    ai: AISelection | None = None


class PlaceSearchRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    query: str = Field(min_length=2, max_length=300)
    open_now: bool = False
    language_code: str = Field(default="en", pattern=r"^[A-Za-z]{2,3}(-[A-Za-z]{2})?$")


class PlacePhotoRequest(BaseModel):
    name: str = Field(max_length=4096, pattern=r"^places/[A-Za-z0-9_-]+/photos/[A-Za-z0-9_-]+$")


class PhotoAuthor(BaseModel):
    displayName: str = ""
    uri: str | None = None


class PlacePhoto(BaseModel):
    name: str
    authorAttributions: list[PhotoAuthor] = Field(default_factory=list)


class Place(BaseModel):
    place_id: str
    name: str
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    rating: float | None = None
    rating_count: int | None = None
    primary_type: str | None = None
    google_maps_url: str
    embed_url: str | None = None
    photo: PlacePhoto | None = None
    details: dict = Field(default_factory=dict)
    photos: list[PlacePhoto] = Field(default_factory=list)


class PlaceIntent(BaseModel):
    is_place_search: bool = False
    search_query: str | None = Field(default=None, max_length=300)
    open_now: bool = False
    language_code: str = Field(default="en", pattern=r"^[A-Za-z]{2,3}(-[A-Za-z]{2})?$")


class ChatResponse(BaseModel):
    answer: str
    suggestions: list[str] = Field(default_factory=list)
    places: list[Place] = Field(default_factory=list)
    intent: PlaceIntent


class ConversationResponse(BaseModel):
    id: UUID
    messages: list[Message] = Field(default_factory=list)


class OpenAIChatRequest(BaseModel):
    model: str | None = None
    messages: list[Message] = Field(min_length=1, max_length=50)
    stream: bool = False
    temperature: float | None = Field(default=None, ge=0, le=2)
