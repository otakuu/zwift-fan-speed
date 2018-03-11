#!/usr/bin/env python
import os
import signal
import subprocess
from time import sleep
import RPi.GPIO as GPIO

GPIO.setmode(GPIO.BOARD)
GPIO.setup(19, GPIO.IN)

previousState=GPIO.input(19)
proc=None

print 'init state:', previousState

while 1:

  # read GPIO
  currentState=GPIO.input(19)
  if currentState != previousState:
  
	if currentState == GPIO.HIGH:
		print "switch on"
		proc = subprocess.Popen("sudo node ./zwift-fan-speed/app.js", shell=True, preexec_fn=os.setsid)
		sleep(5) #wait for startup
	else:
		print "switch off"
		#todo: switch off fan hardware
		if proc:
			os.kill(proc.pid, signal.SIGTERM)
			os.kill(proc.pid+1, signal.SIGTERM) #dirty shit
	
  previousState=currentState
	
  # Warte 1 s
  sleep(1)