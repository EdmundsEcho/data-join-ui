// src/lib/filesToEtlUnits/transforms/span/spanSetOps.js

/**
 * @module lib/filesToEtlUnits/transformLevels/span/spanSetOps
 *
 * @description
 * Defines how to perform the union and intersection operations.
 *
 *     :: [[span]] -> [span]
 *
 * Replicates the logic in the `mms` service that determines if two span values
 * are subsets of each other.  This functionality is useful for two use-cases:
 *
 * 1. Show to the user where `[mspan]` in a group of sources overlap
 *    * implemented in the UI where Expressed = true
 *
 * 2. Determine if a user requested `span` is within the available data
 *    * implemented in `mms` where a `span` can be either `Exp | Red`
 *
 *     span :: { rangeStart::Integer, rangeLength:Integer, reduced:Bool }
 *
 *     intersection :: [span] -> [span] -> [span]
 *     input:
 *        ----------------   ----   ---------- :: spans with the same compMix
 *           -----------       ----       --   :: spans with the same compMix
 *     output:
 *           -----------       --         --   :: spans for both compMixes
 *
 *     mergeContPair :: span -> span -> [span]
 *     pre-process input:
 *        ---------
 *           ----------
 *     pre-process output:
 *        -------------
 *
 *     pre-process input:
 *        ---------
 *                 ----------
 *     pre-process output:
 *        -------------------
 *
 * @todo in MMS Make sure that (0,1) and (1,1) combine to (0,2)
 *
 * @category Lib
 *
 */

/**
-- | Ord used to test for a Subset relation between Spans.
instance Ord Span where
  Exp (Range s1 l1) <= Exp (Range s2 l2) = (s1 >= s2) && ((s1+l1) <= (s2+l2))
  Red (Range s1 l1) <= Exp (Range s2 l2) = (s1 >= s2) && ((s1+l1) <= (s2+l2))
  Red ra1 <= Red ra2 = ra1 <= ra2
  Exp _   <= Red _   = False   -- chosen to be consistent with subset
  */

import * as H from './span-helper';

/**
 * Utilized by the combineSpans module
 *
 *     :: [[span]] -> [span]
 *
 * Union does not need to preserve the list in list of lists to arrive at the
 * correct result.
 *
 * @function
 *
 */
export const spansUnion = (spanss) => {
  // combines juxtaposed and overlapping span values
  return consolidateSpans(
    spanss.reduce((acc, spans) => [...acc, ...spans], []), // append [[]]->[]
  );
};

/**
 *
 * Intersection of spans needs to preserve the list in list of lists to arrive at the
 * correct result.
 *
 *     :: [[span]] -> [span]
 *
 * @function
 *
 */
export const spansOverlap = (spanss) => {
  return spanss.reduce((acc, spans) => intersection(acc)(spans), []);
};

/**
 * Top-level etlField -> etlField with updated
 * * `levels`
 * * `levels-overlap`
 *
 * Likely deprecated because of the input type.
 *
 *     :: etlField -> etlField
 *
 */
export const etlSpanLevels = (etlSpan) => {
  const spanss = etlSpan.sources.map((s) => s.spans);
  return {
    ...etlSpan,
    spans: spansUnion(spanss),
    'levels-overlap': spansOverlap(spanss),
  };
};

/**
 * @description
 * This is the more complex function.
 *   :: [span] -> [span] -> [span]
 *
 * Param 1 & 2 are span levels for different `compMix` combinations (if they
 * were the same, we could use Union on the collection of spans).
 * The return is the span values that represent the intersection/overlap between
 * the collections.
 *
 * @throws Error Using span values with the property reduced = true.
 *
 * Notes:
 * * When consolidating span values can result if two span values only
 * partially overlap.
 * * Each collection of span values are consolidated before the overlap
 * computation.
 * * This means that span values (from the same `compMix`) that
 * juxtapose each other will be converted to a single, continuous span.
 *
 * shrinks the span (only returns subsets)
 *
 * Export for testing only.
 *
 */
export function intersection(spans1) {
  return (spans2) => {
    if (spans1.length === 0) {
      return spans2;
    }
    const spans1C = consolidateSpans(spans1);
    const spans2C = consolidateSpans(spans2);

    // retain the span values::compMix1 that overlap with span values::compMix2
    const part1 = spans1C.filter((s1) => H.isSubsetOfAny(s1, spans2C));
    const part2 = spans2C.filter((s2) => H.isSubsetOfAny(s2, spans1C));

    return consolidateSpans([...part1, ...part2]);
  };
}

/**
 * sort a [span] using rangeStart
 * :: [span] -> [span]
 */

/**
 * :: [span] -> [span]
 * This is the Union operation.
 * Filters out any spans that are subsets or continuous with each other.
 * Where continuous, merges/grows the span.
 * @throws Error When either of the span values have prop reduced: true
 *
 * Cases:
 * 1. span1 is a subset
 * 2. span1 is continuous
 * 3. span1 is separate
 *
 * Export for testing only.
 *
 * Note: May be a useful export for TnC (not just testing)
 *
 */
export function consolidateSpans(spans) {
  if (spans.length === 0) {
    return [];
  }

  // Return generator
  // something that processes
  // 1. spans from the top
  // 2. remainingSpans returned from go
  // 3. stops when remainingSpans = [] or one
  // returns (remaining separate source spans, [acc processed spans] )
  // :: [span] -> calls go -> repeats until remainingSpans.length === 0
  const go = (sourceSpans, processedSpans) => {
    if (sourceSpans.length === 0) {
      return processedSpans; // done, return [consolidated span]
    }
    if (sourceSpans.length === 1) {
      // done, return [consolidated span]
      return [...processedSpans, ...sourceSpans];
    }

    //--------------------------------------------------------------------------
    //  :: span -> [span] -> { span, [span] }
    //--------------------------------------------------------------------------
    //  subroutine for go
    //  will make a new span from combinable spans in [span]
    //  with every new span created, it repeats the process using the remaining
    //  spans.
    /* eslint-disable-next-line no-shadow */
    const repeatFilter = (span, spans) => {
      // the predicate for
      // [span] -> combinable spans::[span]
      const isCombinable = (s1, s2) => {
        return (
          H.isContinuous(s1, s2) || H.isSubset(s1, s2) || H.isSubset(s2, s1) // flip
        );
      };

      const combinableSpans = spans.filter((trySpan) =>
        isCombinable(trySpan, span),
      );

      const remainingSpans = spans.filter(
        (trySpan) => !isCombinable(trySpan, span),
      );

      if (combinableSpans.length > 0) {
        return repeatFilter(
          H.combine([...combinableSpans, span]),
          remainingSpans,
        );
      }
      // console.log("newSpan", span);
      // done, nothing left to combine, return what is required for the next span
      return {
        processedSpan: span,
        remainingSpans,
      };
    };
    const [
      nextTry, // seed for the next span
      ...nextSourceSpans // source for growing the next span
    ] = sourceSpans; // provided by the top-level call to go

    const {
      processedSpan, // the next span now grown
      remainingSpans, // the remaining source for the next seed span
    } = repeatFilter(nextTry, nextSourceSpans);

    return go(
      remainingSpans, // call go again with the remaining source spans
      [...processedSpans, processedSpan], // append the new span to the fn acc
    );
  };

  return go(spans, []).sort((a, b) => a.rangeStart - b.rangeStart);
}
