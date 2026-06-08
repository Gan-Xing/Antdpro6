import { systemControllerGetVersion } from '@/services/nest-web/system';
import { unwrapResponse } from '@/utils/apiResponse';
import { PageContainer, ProCard, ProDescriptions } from '@ant-design/pro-components';
import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react';

const SystemVersionPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState<NestWebAPI.SystemVersionEntity>();

  const loadVersion = async () => {
    setLoading(true);
    try {
      const data = unwrapResponse<NestWebAPI.SystemVersionEntity>(
        await systemControllerGetVersion(),
      );
      setVersion(data);
    } catch (error: any) {
      message.error(error?.response?.data?.message ?? '版本信息加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVersion();
  }, []);

  return (
    <PageContainer
      extra={
        <Button loading={loading} onClick={loadVersion}>
          刷新
        </Button>
      }
    >
      <ProCard>
        <ProDescriptions<NestWebAPI.SystemVersionEntity>
          title="版本信息"
          column={1}
          loading={loading}
          dataSource={version}
          columns={[
            { title: '服务', dataIndex: 'service' },
            { title: '版本', dataIndex: 'version' },
            { title: '运行环境', dataIndex: 'env' },
            { title: 'Node 版本', dataIndex: 'nodeVersion' },
            { title: 'Commit SHA', dataIndex: 'commitSha', copyable: true },
            { title: '构建时间', dataIndex: 'buildTime' },
          ]}
        />
      </ProCard>
    </PageContainer>
  );
};

export default SystemVersionPage;
