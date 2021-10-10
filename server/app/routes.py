from flask import jsonify, request, Blueprint
from psycopg2.extras import RealDictCursor
import psycopg2
import os
import json
from urllib.parse import urlparse 

url = urlparse(os.environ.get('DATABASE_URL'))
connection = psycopg2.connect(database = url.path[1:], user = url.username, password = url.password, host = url.hostname, port = url.port)

bp = Blueprint("routes", __name__)

@bp.route('/tags', methods=["GET"])
def get_tags():

    cursor = connection.cursor(cursor_factory=RealDictCursor)

    cursor.execute("select * from suffix")
    suffixes = cursor.fetchall()
    
    cursor.execute("select * from preffix")
    preffixes = cursor.fetchall()

    cursor.execute('select machine.id, machine_tag, name, json_agg("tag") as tags from machine left join tag on machine.id = tag.machine_id group by machine.id')
    machine_tags = cursor.fetchall()
    
    for machine in machine_tags:
        for tag in machine['tags']:
            if tag:
                del tag['machine_id']
    
    cursor.close()

    return jsonify(suffixes=suffixes , preffixes=preffixes, machine_tags=machine_tags)


@bp.route('/createTag', methods=["POST"])
def create_tag():
    info = request.json['info']
    part = request.json['part']
    description = request.json['description']
    machine = request.json['machine']

    cursor = connection.cursor()
    if machine == None:
        cursor.execute("insert into %s values (default, %%s, %%s) returning id" % info, [part, description])
        new_id = cursor.fetchone()[0]
    else:
        cursor.execute("insert into tag values (default, %s, %s, %s) returning id", [part, description, machine])
        new_id = cursor.fetchone()[0]
    
    connection.commit()
    cursor.close()

    return jsonify(id=new_id)