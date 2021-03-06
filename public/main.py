"""`main` is the top level module for your Flask application."""

# Import the Flask Framework
from flask import Flask, render_template
app = Flask(__name__)



@app.route('/')
def init():
    return app.send_static_file('main.html')


@app.errorhandler(404)
def page_not_found(e):
    return 'Sorry, Nothing at this URL.', 404


@app.errorhandler(500)
def application_error(e):
    return 'Sorry, unexpected error: {}'.format(e), 500
