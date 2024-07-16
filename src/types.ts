export interface CliResults {
  projectName: string;
  flags: {
    packageManager: string;
    overwrite: boolean;
    eas: boolean;
    noInstall: boolean;
    noGit: boolean;
    importAlias: boolean;
  };
  packages?: Array<{
    name: string;
    type: string;
    options?: {
      type?: string;
      selectedComponents?: string[];
    };
  }>;
}
