const fs = require('node:fs/promises');
const getDirName = require('path').dirname;

const TAB = '  ';

async function generatePokemonTypes() {
    const base = 'https://pokeapi.co/api/v2/';
    const url = new URL('type', base);
    url.searchParams.set('limit', '100');

    console.log('Reading Pokemon types from API');
    const res = await fetch(url);
    const types = (await res.json()).results;
    console.log('Successfully read Pokemon types from API');
    
    const path = '../src/app/__typegen/types.ts';
    try {
        await fs.mkdir(getDirName(path), { recursive: true });
        await fs.writeFile(path, '', { flag: 'wx' });
    } catch (error) {
        try {
            console.warn('Failed to create new file. Attempting to delete existing file');
            await fs.unlink(path);
            console.info('Deleted existing file');
        } catch {}
    }

    console.log('Generating TS types...');
    console.debug(`Writing to ${path}`);
    await fs.appendFile(path, `// Generated from ${url} at ${new Date()}\n`);
    await fs.appendFile(path, 'export const POKEMON_TYPE = [');
    // await fs.appendFile(path, 'export type PokemonType = ');
    for (let i = 0; i < types.length; i++) {
        let content = `\n${TAB}'${types[i].name}'`;
        if (i + 1 < types.length) {
            content = `${content},`;
        }
        await fs.appendFile(path, content);
    }
    await fs.appendFile(path, '\n] as const;');
    await fs.appendFile(path, '\n\nexport type PokemonType = (typeof POKEMON_TYPE)[number];');
    console.log('✔️  Done');
}

generatePokemonTypes();