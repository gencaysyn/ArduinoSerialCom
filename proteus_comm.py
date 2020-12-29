import serial
import json
import requests

set_temp_check = "ACTUAL_TEMPERATURE="
act_temp_check = "SET_POINT_TEMPERATURE="
seperator = "="


class APIHandler:
    def __init__(self, host):
        self.host = host

    def setTemp(self, data):
        try:
            requests.put(url=self.host + "put/" + data["id"], json=data)
        except Exception as e:
            print("API error => " + e.__str__())
            exit(-1)

    def getSetPoint(self, id):
        try:
            res = requests.get(url=self.host + "sera/json/" + id)
            return res.json()["greenHouse"]["set_point"]
        except Exception as e:
            print("API error => " + e.__str__())
            exit(-1)


class SerialHandler:
    def __init__(self, port, baud):
        try:
            self.arduino = serial.Serial(port, baud, timeout=2.)
        except Exception as e:
            print("serial error => " + e.__str__())
            exit(-1)

    def getTemp(self):
        respond = self.arduino.readline()[:-2]
        respond = respond.decode("utf-8")
        print("Arduino Respond >>> ", respond)
        if not respond:
            temp = -274
        elif act_temp_check in respond:
            temp = respond.split(seperator)[1]
        else:
            temp = -274
        return temp

    def setTemp(self, temp):
        temp = "<"+str(temp)+">"
        self.arduino.write(temp.encode("utf-8"))


class SeraMain:
    def __init__(self):
        with open("config", encoding='utf-8') as config_file:
            conf = json.loads(config_file.read())
            print(conf)
            host = conf["host_address"]
            com_port = conf["com_port"]
            baud_rate = conf["baud_rate"]
            self.base_data = {
                "id": conf["sera_id"],
                "name": conf["sera_name"],
                "temperature": -1
            }
        self.Arduino = SerialHandler(com_port, baud_rate)
        if not host.startswith("http"):
            host = "http://" + host
        if not host.endswith("/"):
            host += "/"
        self.API = APIHandler(host)

    def loop(self):
        while True:
            self.base_data["temperature"] = self.Arduino.getTemp()
            self.API.setTemp(self.base_data)
            print(self.API.getSetPoint(self.base_data["id"]))
            self.Arduino.setTemp(int(self.API.getSetPoint(self.base_data["id"])))


if __name__ == "__main__":
    SeraMain().loop()
