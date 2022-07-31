import {
  fixSameAsOtherSubjects,
  getDefaultSubjectName,
} from './single-subject-name';
/**
 *
 * ⚙️  Payload generators
 *
 * 🔑 interface: stateFragment -> payload for action : document
 *
 */
export const lazyFixes = {
  fixSameAsOtherSubjects: (state) => fixSameAsOtherSubjects(state),
  getDefaultSubjectName,
};

export default lazyFixes;
