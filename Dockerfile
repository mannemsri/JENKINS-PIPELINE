# Jenkins LTS + Docker CLI so pipelines can run `docker build` / `docker run`
# on the host's Docker engine (via the mounted /var/run/docker.sock).
FROM jenkins/jenkins:lts-jdk17
USER root
RUN apt-get update \
 && apt-get install -y --no-install-recommends docker.io curl \
 && rm -rf /var/lib/apt/lists/*
USER jenkins
