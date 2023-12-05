import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance = axios;
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}
  async executeSeed() {
    //este deleteMany va eliminar lo que ya esta cada vez que ejecute el seed para no tener duplicados
    await this.pokemonModel.deleteMany({});
    const { data } = await this.axios.get<PokeResponse>(
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
