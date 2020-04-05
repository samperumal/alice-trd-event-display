# UCT TRD Web Interface

This python flask application uses pydim3, Vue and flask-socketio to provide a web-based interface to the TRD module hosted at UCT.

## Setup

### Local DIM install

Download latest _dim_ install files from https://dim.web.cern.ch/dim_unix.html and extract to `~/dim`. 

```bash
wget https://dim.web.cern.ch/dim_v20r26.zip
unzip -a -d ~/dim dim_v20r26
cd ~/dim
tcsh
setenv OS Linux
source .setup
gmake all
```
### Get latest code

```bash
cd ~
git checkout https://github.com/samperumal/uct-trd-ui
chmod u+x run-local.sh
```

### Create python virtual environment

```bash
cd ~/uct-trd-ui
python -m virtualenv venv
export DIMDIR=~/dim
export LD_LIBRARY_PATH=~/dim/linux:$LD_LIBRARY_PATH
pip install -r requirements.txt
```

PyDim is documented here: http://lhcbdoc.web.cern.ch/lhcbdoc/pydim/index.html


## Run local server

```bash
./run-local
```

You should now be able to view the ui at: http://alicetrd.phy.uct.ac.za:5002

