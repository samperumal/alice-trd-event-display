# TRD Event Display

This is a web-based display for event data from the ALICE experiment at CERN, focused on the TRD. Global tracks are displayed along with TRD tracklets, and the corresponding raw data from the TRD detectors can additionally be displayed if available.

![TRD Display](open_days_display.png)

## Static use

The simplest way to use the display is to clone the repository (https://github.com/samperumal/alice-js) and then open the `index.static.html` file directly in the browser.

You can customise this with your own data by providing your own static data script. The current script is included on line 10 of file: 

```html
    <!-- Replace this with the path to your own script file, containing json data -->
    <script src="data/pPb/script.js"></script>
```

You can either change this path, or update the existing file.

## Dynamic use

The alternate option is to use a web-server to dynamically serve data files. The simplest way to get started is to clone the repository (https://github.com/samperumal/alice-js) and then startup a Python 3 webserver in the cloned directory as follows:

```bash
python -m http.server
```

You can then open the display in a browser with the url (http://localhost:8000). 

The data for this display is dynamically loaded from a json file, which defaults to `data/sample.json`. You can either replace this with your own appropriately formatted json, or change the load url in `data/script.js`.

# Python flask server

## Setup

Installation instructions for HEP or your local machine.

Clone repository
```sh
git clone https://github.com/samperumal/alice-js
```

Checkout _server-sessions_ branch.
```sh
cd alice-js/
git checkout -t remotes/origin/server-sessions
```

Create a python virtual environment.
```sh
cd py/
python3 -m pip install --user virtualenv
python3 -m virtualenv venv
source venv/bin/activate # This should be venv/Scripts/activate for windows 
pip install -r requirements.txt
```

## Run
Run the server.
```sh
chmod u+x run-local.sh
./run-local.sh
```

By default the server can be accessed at: http://localhost:5001 and can only be accessed from the machine it is running on.

## Configure

The port, hostname and directory from which tracklet files are loaded is configured in `run-local.sh`. Note that paths are relative to the `py/` directory.

## Running on HEP

Once the server is running, you can access it from any other machine via ssh port forwarding at the same URL as above.
```
ssh -L 5001:localhost:5001 hep02.phy.uct.ac.za
```