# flappy-tub
A game about hot tubs and hard flaps

## Running a dev server locally 

Python 3.12 or later required to be installed

* `cd flappy-tub`
* `pip install poetry`
* `poetry install`
* `uvicorn server.server:app --reload`
* Navigate to: `http://localhost:8000/`

This server will automatically pick up any changes you update a served file so no need to restart the server for every
code change. 
