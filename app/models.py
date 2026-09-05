from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

TravelMode = Literal["driving", "walking", "bicycling", "transit"]


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=8_000)


class ChatRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    message: str = Field(min_length=1, max_length=4_000)
    history: list[Message] = Field(default_factory=list, max_length=20)
    origin: str | None = Field(default=None, max_length=250)
    travel_mode: TravelMode | None = None
    conversation_id: UUID | None = None

    @field_validator("origin")
    @classmethod
    def empty_origin_is_none(cls, value: str | None) -> str | None:
        return value or None


class PlaceSearchRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    query: str = Field(min_length=2, max_length=300)
    origin: str | None = Field(default=None, max_length=250)
    travel_mode: TravelMode = "driving"
    open_now: bool = False
    language_code: str = Field(default="en", pattern=r"^[A-Za-z]{2,3}(-[A-Za-z]{2})?$")


class DirectionsRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    place_id: str = Field(min_length=3, max_length=300, pattern=r"^[A-Za-z0-9_-]+$")
    destination: str = Field(default="Destination", min_length=1, max_length=250)
    origin: str = Field(min_length=2, max_length=250)
    travel_mode: TravelMode = "driving"


class PlacePhotoRequest(BaseModel):
    name: str = Field(
        max_length=4096, pattern=r"^places/[A-Za-z0-9_-]+/photos/[A-Za-z0-9_-]+$"
    )


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


class PlaceIntent(BaseModel):
    is_place_search: bool = False
    search_query: str | None = Field(default=None, max_length=300)
    origin: str | None = Field(default=None, max_length=250)
    travel_mode: TravelMode = "driving"
    open_now: bool = False
    language_code: str = Field(default="en", pattern=r"^[A-Za-z]{2,3}(-[A-Za-z]{2})?$")


class ChatResponse(BaseModel):
    answer: str
    places: list[Place] = Field(default_factory=list)
    intent: PlaceIntent


class ConversationResponse(BaseModel):
    id: UUID
    messages: list[Message] = Field(default_factory=list)


class DirectionsResponse(BaseModel):
    embed_url: str | None = None
    google_maps_url: str


class OpenAIChatRequest(BaseModel):
    model: str | None = None
    messages: list[Message] = Field(min_length=1, max_length=50)
    stream: bool = False
    temperature: float | None = Field(default=None, ge=0, le=2)
