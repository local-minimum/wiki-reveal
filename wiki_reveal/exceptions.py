class WikiError(ValueError):
    pass


class ParsingFailedError(WikiError):
    pass


class NoSuchPageError(WikiError):
    pass
