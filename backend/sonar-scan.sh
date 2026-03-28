#!/bin/bash

./gradlew sonar \
  -Dsonar.projectKey=cloudpulse-monitor \
  -Dsonar.projectName='cloudpulse-monitor' \
  -Dsonar.host.url=http://localhost:7040 \
  -Dsonar.token=sqa_2d06aa815f0a12f0adcd9f1cc86b38750f492cb0