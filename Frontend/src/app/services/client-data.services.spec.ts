import { TestBed } from '@angular/core/testing';
import { EventService } from './event.service';
import { ReservationService } from './reservation.service';

describe('Client mock data services', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('uses the same event codes in the event list and event lookup', () => {
    const service = TestBed.inject(EventService);

    for (const event of service.getAll()) {
      expect(service.getByCode(event.codigo)).toEqual(event);
    }
  });

  it('adds a reservation to the list with the matching event and total', () => {
    const events = TestBed.inject(EventService);
    const reservations = TestBed.inject(ReservationService);
    const event = events.getByCode(1001);

    expect(event).toBeDefined();
    if (!event) {
      throw new Error('Expected event mock 1001 to exist.');
    }

    const reservation = reservations.create(event, 2);
    const savedReservation = reservations.getAll().find(
      ({ codigo }) => codigo === reservation.codigo,
    );

    expect(savedReservation).toBeDefined();
    expect(savedReservation?.evento).toBe(event);
    expect(savedReservation?.total).toBe(event.precio * 2);
    expect(savedReservation?.entradas).toBe(2);
  });

  it('rejects reservation quantities outside the supported range', () => {
    const events = TestBed.inject(EventService);
    const reservations = TestBed.inject(ReservationService);
    const event = events.getByCode(1001);

    expect(event).toBeDefined();
    if (!event) {
      throw new Error('Expected event mock 1001 to exist.');
    }

    expect(() => reservations.create(event, 11)).toThrowError(RangeError);
  });
});
