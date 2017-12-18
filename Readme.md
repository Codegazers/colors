
## Building

~~~
	git clone https://github.com/frjaraur/chgcolors.git

	docker build -t frjaraur/hrm-demo-chgcolors:1.0 chgcolors

~~~


## Green Sample
~~~
docker service create --publish target=3000,published=8000 \
--network ucp-hrm \
--label com.docker.ucp.mesh.http=external_route=http://green.hoplalabs.org,internal_port=3000 \
--name green --env COLOR=green \
frjaraur/hrm-demo-chgcolors:1.0
~~~


## Red Sample
~~~
docker service create --publish target=3000,published=8001 \
--network ucp-hrm \
--label com.docker.ucp.mesh.http=external_route=http://red.hoplalabs.org,internal_port=3000 \
--name red --env COLOR=red \
frjaraur/hrm-demo-chgcolors:1.0
~~~
