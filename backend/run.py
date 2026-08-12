from app import create_app

app = create_app()

if __name__ == '__main__':
    # debug=True gives helpful error pages and auto-reloads on code changes
    app.run(debug=True)