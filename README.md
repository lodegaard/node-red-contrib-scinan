# node-red-contrib-scinan
![Node.js CI](https://github.com/lodegaard/node-red-contrib-scinan/workflows/Node.js%20CI/badge.svg?branch=master)

A Scinan integration node for Node Red. It provides the ability to control thermostats using the Scinan API

Based on Petter Ruud's implementation for Homey. Check it out: https://github.com/PetterRuud/com.scinan.api/

## Supported devices
### ProSmart
- PTS50W

## Setup
Use the configuration node to provide credentials for your Smart-E account. The device node can request thermostats from the server.

## Available nodes
- Scinan configuration
- Scinan device

![Scinan node example](https://user-images.githubusercontent.com/10208671/88537023-05e0eb00-d00d-11ea-9f5b-3d9604891323.png)

## Usage
### Getting status
Retreives the current status of the thermostat. Pass the **status** property to **msg.payload**, or set the **status** property in **msg**.
|  Property     |  Type   |                     Information                        |
|:-----------:  |:-------:|:------------------------------------------------------:|
|  **status**   |   any   | Retreive the status of the device                      |
| **msg.status**|   any   | Retreive the status of the device (alternate input)    |

### Setting values
Pass **set** property to **msg.payload**.
|  Property     |  Type   |                      Information                       |
|:-----------:  |:-------:|:------------------------------------------------------:|
|    **away**   | boolean | True/False. Set away                                   |
|  **target**   |  float  | Set the target temprature (5-27)                       |
|   **mode**    | string  | Set opration mode {*comfort*, *auto*, *day_or_night*}  |