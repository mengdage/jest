/**
 * Copyright (c) 2014-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import type {GlobalConfig, ProjectConfig, Path} from 'types/Config';

import {readInitialCoverage} from 'istanbul-lib-instrument';
import {classes} from 'istanbul-lib-coverage';
import Runtime from 'jest-runtime';

export type CoverageWorkerResult = {|
  coverage: any,
  sourceMapPath: ?string,
|};

const FileCoverage = classes.FileCoverage;

export default function(
  source: string,
  filename: Path,
  globalConfig: GlobalConfig,
  config: ProjectConfig,
): ?CoverageWorkerResult {
  const coverageOptions = {
    collectCoverage: globalConfig.collectCoverage,
    collectCoverageFrom: globalConfig.collectCoverageFrom,
    collectCoverageOnlyFrom: globalConfig.collectCoverageOnlyFrom,
  };
  if (Runtime.shouldInstrument(filename, coverageOptions, config)) {
    // Transform file with instrumentation to make sure initial coverage data is well mapped to original code.
    const transformResult = new Runtime.ScriptTransformer(
      config,
    ).transformSource(filename, source, true);
    const extracted = readInitialCoverage(transformResult.code);

    return {
      coverage: new FileCoverage(extracted.coverageData),
      sourceMapPath: null,
    };
  } else {
    return null;
  }
}
