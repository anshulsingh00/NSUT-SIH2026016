"""
Statutory calculations under the RFCTLARR Act, 2013.

Every compensation figure in the system is derived here and nowhere else,
so the numbers can never disagree between the API, the seed importer,
and any report generated later.
"""

SOLATIUM_MULTIPLIER = 1.0  # 100% of market value, Section 30(1)


def calculate_compensation(
    area_acre: float | None,
    circle_rate_per_acre: float | None,
    additional_asset_value: float | None = 0.0,
) -> dict:
    """
    Return the statutory compensation breakdown for one land parcel.

    market_value_total  = area x circle rate
    solatium_amount     = 100% of market value            (Sec 30(1))
    total_compensation  = market value + solatium + assets
    """
    area = area_acre or 0.0
    circle_rate = circle_rate_per_acre or 0.0
    assets = additional_asset_value or 0.0

    market_value_total = round(area * circle_rate, 2)
    solatium_amount = round(market_value_total * SOLATIUM_MULTIPLIER, 2)
    total_compensation = round(market_value_total + solatium_amount + assets, 2)

    return {
        "market_value_total": market_value_total,
        "solatium_amount": solatium_amount,
        "additional_asset_value": assets,
        "total_compensation": total_compensation,
    }
