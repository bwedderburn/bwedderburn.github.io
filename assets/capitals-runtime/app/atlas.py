"""Small offline atlas index and capital-locator projection for MicroPython.

Maps use a plate-carree projection, with longitude scaled by the cosine of
the page's central latitude and the result fitted inside a four-pixel margin.
The fixed x factors below avoid importing a desktop GIS or trigonometry library
on the badge. The host map builder uses these exact same projection functions.
"""

SCHEMA_VERSION = 1
MAP_WIDTH = 320
MAP_HEIGHT = 150
MAP_MARGIN = 4


def _page(page_id, title, bounds, x_factor, scope="world"):
    return {
        "id": page_id,
        "title": title,
        "asset": "assets/maps/" + page_id + ".png",
        "bounds": bounds,
        "x_factor": x_factor,
        "scope": scope,
    }


PAGES = (
    _page("world", "World overview", (-180, -90, 180, 90), 1.0),
    _page("africa", "Africa", (-26, -37, 55, 38), 0.999962),
    _page("africa_north", "Northern Africa", (-18, 14, 53, 38), 0.898794),
    _page("africa_west", "Western Africa", (-26, -1, 17, 29), 0.970296),
    _page("africa_central", "Central Africa", (5, -16, 36, 15), 0.999962),
    _page("africa_east", "Eastern Africa", (20, -27, 56, 20), 0.998135),
    _page("africa_south", "Southern Africa", (8, -36, 43, -7), 0.930418),
    _page("asia", "Asia", (25, -12, 180, 78), 0.838671),
    _page("asia_west", "Western Asia", (25, 10, 65, 46), 0.882948),
    _page("asia_central", "Central Asia", (45, 33, 90, 56), 0.713250),
    _page("asia_south", "Southern Asia", (59, -2, 98, 38), 0.951057),
    _page("asia_southeast", "Southeast Asia", (90, -12, 142, 29), 0.989016),
    _page("asia_east", "Eastern Asia", (96, 18, 148, 53), 0.814116),
    _page("europe", "Europe", (-25, 34, 60, 73), 0.594823),
    _page("europe_detail", "Europe detail", (-13, 35, 39, 60), 0.675590),
    _page("north_america", "North America", (-172, 5, -50, 84), 0.713250),
    _page("central_america", "Central America", (-119, 5, -75, 34), 0.942641),
    _page("caribbean", "Caribbean", (-90, 9, -58, 29), 0.945519),
    _page("south_america", "South America", (-83, -57, -33, 14), 0.930418),
    _page("oceania", "Oceania", (110, -51, 225, 32), 0.986286),
    _page("oceania_west", "Western Pacific islands", (130, -12, 180, 24), 0.994522),
    _page("oceania_east", "Eastern Pacific islands", (170, -28, 220, 12), 0.990268),
    _page("indian_ocean", "Indian Ocean islands", (40, -27, 80, 10), 0.989016),
    _page("antarctica", "Antarctica: no capitals", (-180, -90, 180, -55), 0.300706),
    _page("us", "United States: mainland", (-126, 24, -66, 51), 0.793353, "us"),
    _page("us_east", "Eastern United States", (-94, 24, -66, 48), 0.809017, "us"),
    _page("us_alaska", "Alaska", (-190, 50, -128, 73), 0.477159, "us"),
    _page("us_hawaii", "Hawaii", (-162, 18, -154, 23), 0.936672, "us"),
    _page("us_caribbean", "U.S. Caribbean territories", (-68.5, 17, -64, 20), 0.948324, "us"),
    _page("us_pacific", "Guam and Northern Marianas", (140, 10, 149, 22), 0.961262, "us"),
    _page("us_samoa", "American Samoa", (-174, -16, -168, -10), 0.974370, "us"),
)


def get_page(page_or_id):
    """Accept an existing page dictionary or resolve its stable ID."""
    if isinstance(page_or_id, dict):
        return page_or_id
    for candidate in PAGES:
        if candidate["id"] == page_or_id:
            return candidate
    raise ValueError("Unknown atlas page")


def _transform(page):
    west, south, east, north = page["bounds"]
    longitude_width = (east - west) * page["x_factor"]
    latitude_height = north - south
    scale = min((MAP_WIDTH - 2 * MAP_MARGIN) / longitude_width,
                (MAP_HEIGHT - 2 * MAP_MARGIN) / latitude_height)
    x_offset = (MAP_WIDTH - longitude_width * scale) / 2
    y_offset = (MAP_HEIGHT - latitude_height * scale) / 2
    return x_offset, y_offset, scale * page["x_factor"], scale


def _project_unclipped(page, lat, lon):
    """Project already-unwrapped coordinates; the host builder clips polygons."""
    west, _, _, north = page["bounds"]
    x_offset, y_offset, x_scale, y_scale = _transform(page)
    return x_offset + (lon - west) * x_scale, y_offset + (north - lat) * y_scale


def project(page_or_id, lat, lon):
    """Return map-local pixel coordinates, or None when a point is off-page.

    The world uses -180..180. Pacific and Alaska pages wrap the date line so
    an ordinary -171-degree longitude lands beside +178 degrees correctly.
    """
    page = get_page(page_or_id)
    if not isinstance(lat, (int, float)) or not isinstance(lon, (int, float)):
        return None
    if not -90 <= lat <= 90 or not -180 <= lon <= 180:
        return None
    west, south, east, north = page["bounds"]
    centre = (west + east) / 2
    if lon - centre > 180:
        lon -= 360
    elif lon - centre < -180:
        lon += 360
    if not west <= lon <= east or not south <= lat <= north:
        return None
    x, y = _project_unclipped(page, lat, lon)
    return int(x + 0.5), int(y + 0.5)


def pages_for(record):
    """Choose detail/continent pages for a catalog record, ending in world.

    Selection uses the capital's locator, not polygon area, so tiny countries
    and islands stay available even below the map's one-pixel resolution.
    """
    record_id = record.get("id", "")
    lat, lon = record.get("lat"), record.get("lon")
    if record_id.startswith("US-"):
        special = {
            "US-AK": ("us_alaska",), "US-HI": ("us_hawaii",),
            "US-PR": ("us_caribbean",), "US-VI": ("us_caribbean",),
            "US-GU": ("us_pacific",), "US-MP": ("us_pacific",),
            "US-AS": ("us_samoa",),
        }
        mainland = ("us", "us_east") if record.get("region") == "West" else ("us_east", "us")
        candidates = special.get(record_id, mainland)
    else:
        candidates = {
            "Africa": ("africa_north", "africa_west", "africa_central", "africa_east",
                       "africa_south", "indian_ocean", "africa"),
            "Asia": ("asia_west", "asia_central", "asia_south", "asia_southeast",
                     "asia_east", "indian_ocean", "asia"),
            "Europe": ("europe_detail", "europe"),
            "North America": ("caribbean", "central_america", "north_america"),
            "South America": ("south_america",),
            "Oceania": ("oceania_west", "oceania_east", "oceania"),
        }.get(record.get("region"), ())
        # Detail bounds overlap. Prefer the documented statistical subregion
        # rather than classifying a country by whichever rectangle comes first.
        preferred = {
            "Northern Africa": "africa_north",
            "Western Africa": "africa_west",
            "Middle Africa": "africa_central",
            "Eastern Africa": "africa_east",
            "Southern Africa": "africa_south",
            "Western Asia": "asia_west",
            "Central Asia": "asia_central",
            "Southern Asia": "asia_south",
            "South-eastern Asia": "asia_southeast",
            "Eastern Asia": "asia_east",
            "Northern America": "north_america",
            "Central America": "central_america",
            "Caribbean": "caribbean",
        }.get(record.get("subregion"))
        if preferred in candidates:
            candidates = (preferred,) + tuple(page_id for page_id in candidates
                                               if page_id != preferred)
    selected = []
    for page_id in candidates:
        if project(page_id, lat, lon) is not None:
            selected.append(page_id)
    selected.append("world")
    return tuple(selected)
