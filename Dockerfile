FROM python:3.9-slim

COPY requirements.txt /tmp/requirements.txt
# RUN pip3 install --no-cache --no-color --compile -r /tmp/requirements.txt
RUN pip3 install --no-color --compile -r /tmp/requirements.txt

COPY wiki_reveal /srv/wiki_reveal

WORKDIR /srv
CMD gunicorn  --bind 0.0.0.0:8080 --worker-class eventlet -w 1 wiki_reveal.server:app
