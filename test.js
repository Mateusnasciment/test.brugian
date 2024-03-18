import 'dotenv/config';
import debug from 'debug';
const logger = debug('core');

// Gera os atrasos simulados
const delays = Array.from({ length: 50 }, () => Math.floor(Math.random() * 900) + 100);
const load = delays.map(
  (delay) =>
    (): Promise<number> =>
      new Promise((resolve) => {
        setTimeout(() => resolve(Math.floor(delay / 100)), delay);
      })
);

type Task = () => Promise<number>;

const throttle = async (workers: number, tasks: Task[]) => {
  const results: number[] = [];
  const executing = new Set<Promise<void>>();

  const execute = async (task: Task) => {
    try {
      const result = await task();
      results.push(result);
    } catch (error) {
      logger('Error executing task: %O', error);
    } finally {
      executing.delete(promise);
      await schedule();
    }
  };

  const schedule = async () => {
    while (tasks.length > 0 && executing.size < workers) {
      const task = tasks.shift();
      if (task) {
        const promise = execute(task);
        executing.add(promise);
      }
    }
    await Promise.allSettled([...executing]);
  };

  await schedule();
  return results;
};

const bootstrap = async () => {
  logger('Starting...');
  const start = Date.now();
  try {
    const answers = await throttle(5, load);
    logger('Done in %dms', Date.now() - start);
    logger('Answers: %O', answers);
  } catch (error) {
    logger('Bootstrap failed: %O', error);
  }
};

bootstrap().catch((err) => {
  logger('General fail: %O', err);
});
