"""
LAMESE AI application entry point.
"""

from app.application import Application


def main():
    """
    Start LAMESE AI.
    """

    application = Application()

    application.run()


if __name__ == "__main__":
    main()