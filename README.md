# node-red-contrib-scinan
A Scinan integration node for Node Red. It provides the ability to control thermostats using the Scinan API

Based on Petter Ruud's implementation for Homey. Check it out: https://github.com/PetterRuud/com.scinan.api/

## Supported devices
### ProSmart
- PTS50W

## Usage
### Getting status
Retreives the current status of the thermostat
|  Property     |  Type  |  Value   |                     Information                     |
|:-----------:  |:------:|:--------:|:---------------------------------------------------:|
| **payload**   | string | *status* | Retreive the status of the device                   |
| **msg.status**| any    |  *any*   | Retreive the status of the device (alternate input) |