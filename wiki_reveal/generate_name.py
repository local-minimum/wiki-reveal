from random import sample

DESCRIPTOR: list[str] = [
    'fast',
    'smart',
    'flashy',
    'rapid',
    'brilliant',
    'dedicated',
    'free',
    'happy',
    'good',
    'sweet',
    'jovial',
    'affectionate',
    'agreeable',
    'amiable',
    'bright',
    'charming',
    'creative',
    'determined',
    'diligent',
    'dynamic',
    'energetic',
    'friendly',
    'hardworking',
    'helpful',
    'loyal',
    'patient',
    'amazing',
    'awesome',
    'excellent',
    'fabulous',
    'unique',
    'perfect',
    'stellar',
    'upbeat',
    'adept',
    'brave',
    'capable',
    'dazzling',
    'knowledgeable',
    'marvelous',
    'adaptable',
    'confident',
    'devoted',
    'educated',
    'efficient',
    'focused',
    'flexible',
    'qualified',
    'resourceful',
]

ANIMALS: list[str] = [
    'alpaca',
    'aardvark',
    'allosaurus',
    'albatross',
    'alligator',
    'ant',
    'anteater',
    'axolotl',
    'armadillo',
    'badger',
    'barnacle',
    'bat',
    'bee',
    'bonobo',
    'butterfly',
    'bison',
    'bear',
    'beetle',
    'bullsnake',
    'chipmunk',
    'chimaera',
    'cockatoo',
    'crane',
    'crow',
    'coyote',
    'crab',
    'carp',
    'cat',
    'crocodile',
    'dodo',
    'dingo',
    'elk',
    'earthworm',
    'emu',
    'eel',
    'frog',
    'firefly',
    'ferret',
    'flounder',
    'gecko',
    'gnat',
    'gerbil',
    'goose',
    'guppy',
    'hyena',
    'heron',
    'herring',
    'ibis',
    'impala',
    'iguana',
    'jackdaw',
    'jellyfish',
    'kangaroo',
    'koala',
    'krill',
    'kestrel',
    'lemur',
    'leech',
    'lizard',
    'lobster',
    'marmot',
    'mallard',
    'magpie',
    'millipede',
    'newt',
    'octopus',
    'oyster',
    'owl',
    'ocelot',
    'possum',
    'python',
    'platypus',
    'pika',
    'prawn',
    'quail',
    'robin',
    'rodent',
    'seal',
    'shark',
    'sloth',
    'swan',
    'shrimp',
    'tapir',
    'turtle',
    'turkey',
    'tick',
    'velociraptor',
    'viper',
    'vulture',
    'woodlouse',
    'wolf',
    'wasp',
    'worm',
    'yak',
    'zebra',
]


def generate_name() -> str:
    [descriptor] = sample(DESCRIPTOR, 1)
    [animal] = sample(ANIMALS, 1)
    return f'{descriptor.capitalize()} {animal.capitalize()}'