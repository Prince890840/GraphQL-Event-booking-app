const bcrypt = require("bcryptjs");

const EventModel = require("../../models/event");
const UserModel = require("../../models/user");
const BookingModel = require("../../models/booking");

// manually binding eventIds
const events = async (eventIds) => {
  try {
    const events = await EventModel.find({ _id: { $in: eventIds } });
    events.map((event) => {
      return {
        ...event._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event.creator),
      };
    });
    return events;
  } catch (error) {
    console.log(error);
  }
};

const user = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    return {
      ...user._doc,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (err) {
    console.log(err);
  }
};

const singleEvent = async (eventId) => {
  try {
    const event = await EventModel.findById(eventId);
    return {
      ...event._doc,
      creator: user.bind(this, event.creator),
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await EventModel.find();
      return events.map((event) => {
        return {
          ...event._doc,
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (error) {
      console.log(error);
    }
  },

  bookings: async () => {
    try {
      const bookings = await BookingModel.find();
      return bookings.map((booking) => {
        return {
          ...booking._doc,
          user: user.bind(this, booking._doc.user),
          event: singleEvent.bind(this, booking._doc.event),
          createdAt: new Date(booking._doc.createdAt).toISOString(),
          updatedAt: new Date(booking._doc.updatedAt).toISOString(),
        };
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (args) => {
    const event = new EventModel({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "6429664e539ee0e700e7f028",
    });

    let createdEvent;

    try {
      // if you don't return then express graphql complete instantly therefore not get a valid result
      const response = await event.save();

      /* enriched object with a lot of metadata
          give the core properties made that make up our document or event object */

      createdEvent = {
        ...response._doc,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, response._doc.creator),
      };
      const creator = await UserModel.findById("6429664e539ee0e700e7f028");

      if (!creator) {
        throw new Error(`User ${args.userInput.email} not found.!`);
      }
      creator.createdEvents.push(event);
      await creator.save();

      console.log(response);

      return createdEvent;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  createUser: async (args) => {
    try {
      const existingUserResponse = await UserModel.findOne({
        email: args.userInput.email,
      });
      if (existingUserResponse) {
        throw new Error(`User ${args.userInput.email} already exists`);
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new UserModel({
        email: args.userInput.email,
        password: hashedPassword,
      });
      const result = await user.save();

      return { ...result._doc, _id: result._id };
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  bookEvent: async (args) => {
    const fetchedEvent = await EventModel.findOne({ _id: args.eventId });
    const booking = new BookingModel({
      user: "6429664e539ee0e700e7f028",
      event: fetchedEvent,
    });
    const result = await booking.save();
    return {
      ...result._doc,
      user: user.bind(this, booking._doc.user),
      event: singleEvent.bind(this, booking._doc.event),
      createdAt: new Date(booking._doc.createdAt).toISOString(),
      updatedAt: new Date(booking._doc.updatedAt).toISOString(),
    };
  },
  cancelBooking: async (args) => {
    try {
      const booking = await BookingModel.findById(args.bookingId).populate(
        "event"
      );
      const event = {
        ...booking.event._doc,
        creator: user.bind(this, booking.event._doc.creator),
      };
      await BookingModel.deleteOne({ _id: args.bookingId });
      return event;
    } catch (e) {
      throw e;
    }
  },
};
