import _ from 'lodash';

export const reprocessTextContent = (content: string) => {
  const remappedContent = content
    .replaceAll('  ', ' ')
    .replaceAll(' .', '.')
    .replaceAll('ş', 'ș')
    .replaceAll('Ş', 'Ș')
    .replaceAll('ţ', 'ț')
    .replaceAll('Ţ', 'Ț')
    .replaceAll('doamne', 'Doamne')
    .replaceAll('domnul', 'Domnul')
    .replaceAll('duhul', 'Duhul')
    .replaceAll('dumnezeu', 'Dumnezeu')
    .replaceAll('golgota', 'Golgota')
    .replaceAll('isus', 'Isus')
    .replaceAll('isuse', 'Isuse')
    .replaceAll('mesia', 'Mesia')
    .replaceAll("'", '’')
    .replaceAll('‘', '’')
    .replaceAll('"', '”')
    .replaceAll('…', '...')
    .replaceAll('//', '/');

  return _.trim(remappedContent);
};
