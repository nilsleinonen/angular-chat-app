import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
const cors = require('cors')({ origin: 'http://localhost:4200' });
import { StreamChat } from 'stream-chat';

const serverStreamClient = StreamChat.getInstance(
  functions.config().stream.key,
  functions.config().stream.secret
);

admin.initializeApp();

export const createStreamUser = functions.https.onRequest(
  (request, response) => {
    cors(request, response, async () => {
      const { user } = request.body;
      if (!user) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Bad request'
        );
      } else {
        try {
          await serverStreamClient.upsertUser({
            id: user.uid,
            name: user.displayName,
            email: user.email,
          });
          response.status(200).send({ message: 'User created' });
        } catch (error) {
          throw new functions.https.HttpsError(
            'aborted',
            'Could not create Stream user'
          );
        }
      }
    });
  }
);

export const createStreamToken = functions.https.onRequest(
  (request, response) => {
    cors(request, response, async () => {
      const { user } = request.body;
      if (!user) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Bad request'
        );
      }
      try {
        const token = await serverStreamClient.createToken(user.uid);
        response.status(200).send({ token });
      } catch (error) {
        throw new functions.https.HttpsError(
          'aborted',
          'Could not create Stream user'
        );
      }
    });
  }
);
