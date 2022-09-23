import requests
import re
import json


def get_url(page: str) -> str:
    return f'https://en.wikipedia.org/w/api.php?action=parse&page={page}&format=json'  # noqa: E501


def get_page(
    page: str = 'Wikipedia:Vital_articles/Level/4/Everyday_life',
) -> dict:
    response = requests.get(get_url(page))
    return response.json()


def get_relevant_links(json: dict, *, key='*', irrelevance=':') -> list[str]:
    return [p[key] for p in json['parse']['links'] if irrelevance not in p[key]]


def build_pages(root: str = 'Wikipedia:Vital_articles/Level/4', key='*'):
    page = get_page(root)
    return {
        p[len(root) + 1:]: get_relevant_links(get_page(p))
        for p in re.findall(f'{root}/[^"\n ]+', page['parse']['text'][key])
    }


with open('pages.json', 'w') as fh:
    json.dump(build_pages(), fh)