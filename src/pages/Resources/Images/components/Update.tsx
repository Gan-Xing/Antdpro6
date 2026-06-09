import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { message, Upload } from 'antd';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';
import React, { useEffect, useState } from 'react';
import { getAccessToken, formatToken } from '@/utils/auth';
import { useDictOptions } from '@/hooks/useDictOptions';
import MapPicker from './MapPicker';
import { Form } from 'antd';
import { useIntl } from '@umijs/max';
import { imageCategoryFallbackOptions } from '../constants';

interface UpdateFormProps {
  updateModalOpen: boolean;
  onCancel: () => void;
  onSubmit: (values: Images.UpdateParams) => Promise<boolean>;
  values: Partial<Images.Entity>;
}

const UpdateForm: React.FC<UpdateFormProps> = (props) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [mapLocation, setMapLocation] = useState<Images.LocationType>();
  const [form] = Form.useForm();
  const intl = useIntl();
  const { options: imageCategoryOptions } = useDictOptions(
    'image.category',
    imageCategoryFallbackOptions,
  );

  useEffect(() => {
    if (props.updateModalOpen && props.values) {
      form.setFieldsValue({
        ...props.values,
        tags: props.values.tags || [],
      });

      // 设置地图位置
      if (props.values.location) {
        try {
          // 如果 location 是字符串，尝试解析它
          const locationData =
            typeof props.values.location === 'string'
              ? JSON.parse(props.values.location)
              : props.values.location;

          setMapLocation(locationData);
          form.setFieldsValue({ location: locationData });
        } catch (error) {
          console.error('Failed to parse location data:', error);
        }
      } else {
        console.log('No location data provided');
      }
      // 如果有照片，初始化文件列表
      if (props.values.photos) {
        setFileList(
          props.values.photos.map((url, index) => ({
            uid: `-${index}`,
            name: url.split('/').pop() || `image-${index}`,
            status: 'done',
            url,
            response: { data: { data: { url } } },
          })),
        );
      }
    }
  }, [props.updateModalOpen, props.values, form]);

  // 处理文件上传
  const handleUpload: UploadProps['onChange'] = async ({ file, fileList }) => {
    const updatedFileList = fileList.map((f: UploadFile) => {
      if (f.uid === file.uid) {
        if (file.status === 'done' && file.response?.data?.data?.url) {
          return {
            ...f,
            status: file.status,
            response: file.response,
            url: file.response.data.data.url,
            thumbUrl: file.response.data.data.url,
          };
        }
        return { ...f, status: file.status, response: file.response };
      }
      return f;
    });

    setFileList(updatedFileList);

    if (file.status === 'uploading') {
      console.log('Uploading:', file, fileList);
    } else if (file.status === 'done') {
      const url = file.response?.data?.data?.url;
      if (url) {
        message.success(
          intl.formatMessage(
            {
              id: 'pages.resources.images.upload.success',
              defaultMessage: '{name} uploaded successfully',
            },
            {
              name: file.name,
            },
          ),
        );
      } else {
        message.warning(
          intl.formatMessage(
            {
              id: 'pages.resources.images.upload.error',
              defaultMessage: '{name} upload failed: {error}',
            },
            {
              name: file.name,
              error: intl.formatMessage({
                id: 'pages.resources.images.upload.error.noUrl',
                defaultMessage: 'No URL returned',
              }),
            },
          ),
        );
        console.warn('Upload response without URL:', file.response);
      }
    } else if (file.status === 'error') {
      message.error(
        intl.formatMessage(
          {
            id: 'pages.resources.images.upload.error',
            defaultMessage: '{name} upload failed: {error}',
          },
          {
            name: file.name,
            error:
              file.error?.message ||
              intl.formatMessage({
                id: 'pages.resources.images.upload.error.unknown',
                defaultMessage: 'Unknown error',
              }),
          },
        ),
      );
      console.error('Upload error:', file.error);
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>
        {intl.formatMessage({
          id: 'pages.resources.images.upload',
          defaultMessage: 'Upload',
        })}
      </div>
    </div>
  );

  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/images/upload',
    headers: {
      Authorization: formatToken(getAccessToken()),
    },
    onChange: handleUpload,
    multiple: false,
    maxCount: 1,
    listType: 'picture-card',
    fileList,
    accept: 'image/*,.heic',
    beforeUpload: (file: RcFile) => {
      const isImage = file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.heic');
      if (!isImage) {
        message.error(
          intl.formatMessage(
            { id: 'pages.resources.images.upload.error.type' },
            { name: file.name },
          ),
        );
        return Upload.LIST_IGNORE;
      }
      return true;
    },
  };

  return (
    <ModalForm
      title={intl.formatMessage({
        id: 'pages.resources.images.edit',
        defaultMessage: 'Edit',
      })}
      width={800}
      form={form}
      open={props.updateModalOpen}
      onOpenChange={(visible) => {
        if (visible) {
          form.setFieldsValue({
            ...props.values,
            location: props.values.location,
          });
        } else {
          form.resetFields();
          setFileList([]);
          props.onCancel();
        }
      }}
      onFinish={async (values) => {
        const photos = fileList
          .filter((file) => file.status === 'done')
          .map((file) => file.response?.data?.data?.url)
          .filter(Boolean) as string[];

        if (photos.length === 0) {
          message.error(intl.formatMessage({ id: 'pages.resources.images.upload.required' }));
          return false;
        }

        const success = await props.onSubmit({
          id: props.values.id!,
          ...values,
          photos,
        });

        if (success) {
          props.onCancel();
          form.resetFields();
          setFileList([]);
        }
        return success;
      }}
      layout="vertical"
    >
      <ProFormSelect
        name="area"
        label={intl.formatMessage({
          id: 'pages.resources.images.area',
          defaultMessage: 'Project Area',
        })}
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.area.placeholder',
          defaultMessage: 'Please select project area',
        })}
        options={[
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.temporary' }),
            value: 'temporary',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.soil_disposal' }),
            value: 'soil_disposal',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.soil_filling' }),
            value: 'soil_filling',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.soil_replacement' }),
            value: 'soil_replacement',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.subgrade' }),
            value: 'subgrade',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.gravel_base' }),
            value: 'gravel_base',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.asphalt_surface' }),
            value: 'asphalt_surface',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.demolition' }),
            value: 'demolition',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.structure' }),
            value: 'structure',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.traffic_sign' }),
            value: 'traffic_sign',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.environment' }),
            value: 'environment',
          },
          {
            label: intl.formatMessage({ id: 'pages.resources.images.area.public_facilities' }),
            value: 'public_facilities',
          },
        ]}
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="category"
        label={intl.formatMessage({
          id: 'pages.resources.images.category',
          defaultMessage: 'Category',
        })}
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.category.placeholder',
          defaultMessage: 'Please select category',
        })}
        options={imageCategoryOptions}
        rules={[{ required: true }]}
      />
      <ProFormSelect
        name="tags"
        label={intl.formatMessage({
          id: 'pages.resources.images.tags',
          defaultMessage: 'Tags',
        })}
        mode="tags"
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.tags.placeholder',
          defaultMessage: 'Enter tags. Multiple tags are supported.',
        })}
        fieldProps={{
          tokenSeparators: [',', ' '],
        }}
      />
      <ProFormTextArea
        name="description"
        label={intl.formatMessage({
          id: 'pages.resources.images.description',
          defaultMessage: 'Description',
        })}
        placeholder={intl.formatMessage({
          id: 'pages.resources.images.description.required',
          defaultMessage: 'Please enter description',
        })}
        rules={[
          {
            required: true,
            message: intl.formatMessage({ id: 'pages.resources.images.description.required' }),
          },
        ]}
      />
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1 }}>
          <ProFormText
            name="stakeNumber"
            label={intl.formatMessage({
              id: 'pages.resources.images.stakeNumber',
              defaultMessage: 'Stake Number',
            })}
            placeholder={intl.formatMessage({
              id: 'pages.resources.images.stakeNumber.placeholder',
              defaultMessage: 'Please enter stake number',
            })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <ProFormText
            name="offset"
            label={intl.formatMessage({
              id: 'pages.resources.images.offset',
              defaultMessage: 'Offset',
            })}
            placeholder={intl.formatMessage({
              id: 'pages.resources.images.offset.placeholder',
              defaultMessage: 'Please enter offset',
            })}
          />
        </div>
      </div>
      <Form.Item
        name="location"
        label={intl.formatMessage({
          id: 'pages.resources.images.location',
          defaultMessage: 'Location',
        })}
        tooltip={intl.formatMessage({
          id: 'pages.resources.images.location.tooltip',
          defaultMessage: 'Click the map to select a location, or click "Get Current Location".',
        })}
      >
        <MapPicker
          value={mapLocation}
          onChange={(location) => {
            setMapLocation(location);
            form.setFieldsValue({ location });
          }}
        />
      </Form.Item>
      <Form.Item
        label={intl.formatMessage({
          id: 'pages.resources.images.photos',
          defaultMessage: 'Photos',
        })}
        required
        tooltip={intl.formatMessage({
          id: 'pages.resources.images.photos.tooltip',
          defaultMessage: 'Supports jpg, png, gif, webp, and heic formats',
        })}
      >
        <Upload {...uploadProps}>{fileList.length >= 1 ? null : uploadButton}</Upload>
      </Form.Item>
    </ModalForm>
  );
};

export default UpdateForm;
