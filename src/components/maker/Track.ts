import { Instrument } from '../../global';
import Key from '../piano/Key';
import { Segments } from './Segments';
import { Segment } from './Segment';

const DEFAULT_INSTRUMENT: Instrument = 'piano';
const DEFAULT_SIZE = 200;
const TEMPO = 0.25;

export { Segments } from './Segments';
export { Segment } from './Segment';

export class Track {
  segments: Segments;
  id: number;
  instrument: Instrument;
  size = DEFAULT_SIZE;

  constructor(
    segments = new Segments(),
    id = 0,
    instrument = DEFAULT_INSTRUMENT,
  ) {
    this.segments = segments;
    this.id = id;
    this.instrument = instrument;
  }

  set(id: number, newSegment: Partial<Segment>): Track {
    const segment = { ...this.segments.get(id), ...newSegment };
    this.segments.update(id, segment);
    return this.clone();
  }

  append(instrument = this.instrument): Track {
    this.id = this.segments.append(instrument);
    return this.clone();
  }

  remove(id: number): Track {
    this.segments.delete(id);
    return this.clone();
  }

  setInstrument(instrument = this.segments.get(this.id).instrument): Track {
    this.instrument = instrument;
    return this.clone();
  }

  setSelected(id = this.segments.getNextId(this.id)): Track {
    this.id = id;
    return this.clone();
  }

  clone(): Track {
    return new Track(this.segments, this.id, this.instrument);
  }

  isSegmentValid(id: number, segment: Segment): boolean {
    return (
      segment.start + segment.duration <= this.size &&
      segment.start >= 0 &&
      this.segments.doesSpanFit(id, segment)
    );
  }

  getPlayParameters(): {
    events: [number, Key[]][];
    end: number;
    paramsIter: IterableIterator<{ duration: number; instrument: Instrument }>;
  } {
    const segments = this.segments
      .entries()
      .sort(([i, a], [j, b]) => a.start - b.start || i - j);
    const events: [number, Key[]][] = segments.map(([, { start, keys }]) => [
      start * TEMPO,
      keys,
    ]);
    const paramsIter = segments
      .map(([, { duration, instrument }]) => ({
        duration: duration * TEMPO,
        instrument,
      }))
      .values();
    const end =
      TEMPO *
      Math.max(...segments.map(([, { start, duration }]) => start + duration));

    return { events, paramsIter, end };
  }
}
