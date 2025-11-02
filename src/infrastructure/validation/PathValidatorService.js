const fs = require('fs');
const path = require('path');
const IPathValidator = require('../../application/ports/IPathValidator');

/**
 * PathValidatorService - Infrastructure Implementation
 * Implements IPathValidator for file system path validation
 */
class PathValidatorService extends IPathValidator {
  constructor() {
    super();
    this.allowedBasePaths = [
      '/Users',
      '/home',
      '/tmp',
      '/opt',
      process.cwd()
    ];
  }

  validatePath(repositoryPath) {
    try {
      if (!repositoryPath || typeof repositoryPath !== 'string') {
        return {
          isValid: false,
          error: 'Repository path must be a non-empty string'
        };
      }

      const absolutePath = path.resolve(repositoryPath);

      if (!fs.existsSync(absolutePath)) {
        return {
          isValid: false,
          error: 'Repository path does not exist'
        };
      }

      const stats = fs.statSync(absolutePath);
      if (!stats.isDirectory()) {
        return {
          isValid: false,
          error: 'Repository path must be a directory'
        };
      }

      if (!this.isPathAllowed(absolutePath)) {
        return {
          isValid: false,
          error: 'Repository path is not within allowed directories'
        };
      }

      const gitPath = path.join(absolutePath, '.git');
      const isGitRepo = fs.existsSync(gitPath);

      return {
        isValid: true,
        normalizedPath: absolutePath,
        absolutePath,
        isGitRepository: isGitRepo,
        info: {
          path: absolutePath,
          isGitRepo,
          size: this.getDirectorySize(absolutePath)
        }
      };

    } catch (error) {
      return {
        isValid: false,
        error: `Path validation failed: ${error.message}`
      };
    }
  }

  isPathAllowed(absolutePath) {
    return this.allowedBasePaths.some(basePath => {
      const resolvedBasePath = path.resolve(basePath);
      return absolutePath.startsWith(resolvedBasePath);
    });
  }

  getDirectorySize(dirPath) {
    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });
      let fileCount = 0;
      let dirCount = 0;

      files.forEach(file => {
        if (file.isFile()) {
          fileCount++;
        } else if (file.isDirectory() && !file.name.startsWith('.')) {
          dirCount++;
        }
      });

      return {
        fileCount,
        dirCount,
        totalItems: fileCount + dirCount
      };
    } catch (error) {
      return {
        fileCount: 0,
        dirCount: 0,
        totalItems: 0
      };
    }
  }
}

module.exports = PathValidatorService;
