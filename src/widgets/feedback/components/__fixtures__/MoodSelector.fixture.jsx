import MoodSelector, { DEFAULT_MOODS_LIST as moods } from '../MoodSelector';

/* eslint-disable no-console */

const Component = () => {
  const handleMoodChange = () => {
    console.log('handle mood change');
  };
  return (
    <div style={{ margin: '20px', width: '300px' }}>
      <MoodSelector moods={moods} handleChange={handleMoodChange} />
    </div>
  );
};

export default <Component />;
