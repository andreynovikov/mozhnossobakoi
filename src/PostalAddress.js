const substitutionList = {
    'республика': 'респ.',
    'область': 'обл.',
    'район': 'р-н',
    'город': 'г.',
    'посёлок': 'п.',
    'деревня': 'д.',
    'село': 'с.',
    'остров': 'о.',
    'шоссе': 'ш.',
    'улица': 'ул.',
    'площадь': 'пл.',
    'проспект': 'пр.',
    'проезд': 'пр-д',
    'переулок': 'пер.',
    'набережная': 'наб.',
};

function substitute(address) {
    const parts = address.split(/,\s+/);
    for (var i=0; i < parts.length; i++) {
        const items = parts[i].split(/\s+/);
        for (var j=0; j < items.length; j++) {
            if (items[j] in substitutionList)
                items[j] = substitutionList[items[j]];
        }
        parts[i] = items.join(' ');
    }
    return parts.join(', ');
}

export default function PostalAddress({address}) {
    return substitute(address);
};
