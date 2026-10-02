# 得物 AIGC 创意站 · 常用命令
# 用法示例：
#   make ingest_day URL=https://youtu.be/xxx CATEGORY=ai-ad GIF_A=... GIF_B=... INTRO="…"
#   make pick_week_top3 WEEK=2026-W38 HOTTEST=<id> INFLUENTIAL=<id> CREATIVE=<id>
#   make gifs SRC=clip.mp4 SLUG=my-clip
#   make build_feed && make frontend-build

PY ?= python3
NPM ?= npm
CONTENT ?= content
FEED ?= frontend/src/data/feed.json

# ingest_day 参数
URL ?=
TITLE ?=
CATEGORY ?=
ORIENTATION ?= landscape
GIF_A ?=
GIF_B ?=
INTRO ?=
AUTHOR ?=
TAGS ?=
DATE ?=
NOTES ?=
FROM_JSON ?=
EXTRA ?=

# pick_week_top3 参数
WEEK ?=
HOTTEST ?=
INFLUENTIAL ?=
CREATIVE ?=
NOTE ?=

# make_gifs 参数
SRC ?=
SLUG ?=
OUT_DIR ?= dist/gifs
GIF_ARGS ?=

# 远端后端（可选）
API ?=
ADMIN_TOKEN ?=

.PHONY: help build_feed ingest_day pick_week_top3 list_week gifs dev-frontend frontend-build dev-backend check

help:
	@sed -n '1,8p' Makefile

build_feed:
	$(PY) scripts/build_feed.py --content $(CONTENT) --out $(FEED)

ingest_day:
ifneq ($(FROM_JSON),)
	$(PY) scripts/ingest_day.py --from-json "$(FROM_JSON)" --content $(CONTENT) --feed-out $(FEED) \
	  $(if $(API),--api $(API) --token $(ADMIN_TOKEN),) $(EXTRA)
else
	$(PY) scripts/ingest_day.py --url "$(URL)" $(if $(TITLE),--title "$(TITLE)",--fetch-meta) \
	  --category "$(CATEGORY)" --orientation "$(ORIENTATION)" \
	  $(if $(GIF_A),--gif-a "$(GIF_A)",) $(if $(GIF_B),--gif-b "$(GIF_B)",) \
	  $(if $(INTRO),--intro "$(INTRO)",) $(if $(AUTHOR),--author "$(AUTHOR)",) \
	  $(if $(TAGS),--tags "$(TAGS)",) $(if $(DATE),--date "$(DATE)",) $(if $(NOTES),--notes "$(NOTES)",) \
	  --content $(CONTENT) --feed-out $(FEED) \
	  $(if $(API),--api $(API) --token $(ADMIN_TOKEN),) $(EXTRA)
endif

list_week:
	$(PY) scripts/pick_week_top3.py --list $(if $(WEEK),--week $(WEEK),) --content $(CONTENT)

pick_week_top3:
	$(PY) scripts/pick_week_top3.py $(if $(WEEK),--week $(WEEK),) \
	  $(if $(HOTTEST),--hottest "$(HOTTEST)",) $(if $(INFLUENTIAL),--influential "$(INFLUENTIAL)",) \
	  $(if $(CREATIVE),--creative "$(CREATIVE)",) $(if $(NOTE),--note "$(NOTE)",) \
	  --content $(CONTENT) --feed-out $(FEED) \
	  $(if $(API),--api $(API) --token $(ADMIN_TOKEN),) $(EXTRA)

gifs:
	$(PY) scripts/make_gifs.py "$(SRC)" --slug "$(SLUG)" --out-dir "$(OUT_DIR)" $(GIF_ARGS)

dev-frontend:
	cd frontend && $(NPM) run dev

frontend-build:
	cd frontend && $(NPM) run build

dev-backend:
	cd backend && $(PY) run.py

check: build_feed
	cd backend && $(PY) -m pytest -q
