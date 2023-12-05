import { Injectable } from '@nestjs/common';

import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}
  async executeSeed() {
    //este deleteMany va eliminar lo que ya esta cada vez que ejecute el seed para no tener duplicados
    await this.pokemonModel.deleteMany({});
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    //para barrer la data y hacer insercion de datos por lote
    const pokemonToInsert: { name: string; no: number }[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      //const pokemon = await this.pokemonModel.create({ name, no });

      //para insertar mutiples registros
      pokemonToInsert.push({ name, no });
    });
    //inserta todos los pokemones por name y numero
    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed Executed';
  }
}
