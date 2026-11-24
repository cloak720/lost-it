"""Smart matching: suggest FOUND items for a LOST item (and vice versa).

Score out of 100:
    Same category ................ 40  (required)
    Same location ................ 30
    Shared keywords in text ...... up to 20  (7 points per shared word)
    Dates close together ......... up to 10  (<= 3 days: 10, <= 7 days: 5)

Only candidates scoring 50 or more are shown, best first.
"""
import re

STOP_WORDS = {
    "the", "and", "for", "with", "near", "from", "this", "that", "was", "were",
    "lost", "found", "item", "have", "has", "had", "left", "some", "one", "his",
    "her", "its", "our", "your", "you", "are", "not", "but", "all", "any", "can",
    "please", "contact", "around", "inside", "outside", "today", "yesterday",
}

MIN_SCORE = 50
MAX_RESULTS = 5


def keywords(text):
    words = re.findall(r"[a-z0-9]+", (text or "").lower())
    return {w for w in words if len(w) > 2 and w not in STOP_WORDS}


def score_match(item, candidate):
    score = 40
    reasons = [f"Same category: {item['category']}"]

    if item["location_id"] == candidate["location_id"]:
        score += 30
        reasons.append(f"Same place: {item['location']}")

    shared = keywords(f"{item['title']} {item['description']}") & keywords(
        f"{candidate['title']} {candidate['description']}"
    )
    if shared:
        score += min(20, 7 * len(shared))
        reasons.append("Similar words: " + ", ".join(sorted(shared)[:5]))

    days_apart = abs((item["item_date"] - candidate["item_date"]).days)
    if days_apart <= 3:
        score += 10
    elif days_apart <= 7:
        score += 5
    reasons.append("Same day" if days_apart == 0 else f"{days_apart} day(s) apart")

    return score, reasons


def rank_matches(item, candidates):
    results = []
    for candidate in candidates:
        score, reasons = score_match(item, candidate)
        if score >= MIN_SCORE:
            results.append({"score": score, "reasons": reasons, "item": candidate})
    results.sort(key=lambda r: r["score"], reverse=True)
    return results[:MAX_RESULTS]
